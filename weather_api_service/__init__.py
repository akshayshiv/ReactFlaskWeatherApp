from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from weather_api_service.config import *
from weather_api_service.utils import *
import json
import requests
from sqlalchemy import func, desc
import uuid
from sqlalchemy import text





app = Flask(__name__, static_folder='frontend/my-react-app/build', static_url_path='/')
app.config.update(app_config_dict)
app.config['SECRET_KEY'] = 'SECRETKEY'
CORS(app)
app.app_context().push()

db = SQLAlchemy(app)
db.init_app(app)


from weather_api_service.models.User import User as UserModel
from weather_api_service.models.City import City as CityModel
from weather_api_service.models.Requests import Requests as RequestsModel


from weather_api_service.routes import User

with app.app_context():
    db.create_all()

print('Adding Users')
try:
    import csv

    file = './data/username.csv'
    dict_from_csv = {}

    with open(file, mode='r') as infile:
        reader = csv.reader(infile)
        for i, line in enumerate(reader):
            if i != 0:
                try:
                    row = list(line)
                    enc_pass = encrypt(secret_key=secret_key, plain_text=row[2])
                    user = UserModel(username=row[1], password=enc_pass, full_name=row[3])
                    db.session.add(user)
                    db.session.commit()
                except Exception as e:
                    db.session.rollback()
except Exception as e:
    pass
print('Users Added')

# We want to add the cities to a separate table with a CityModel so that
# we can optimally query them using indexing and limit the results to 5
# Noticeable performance input by doing this on server start and API query
# than reading in the full JSON and parsing
print('Adding Cities')
city = None
try:
  file = './data/country_data.json'
  with open(file, mode='r') as infile:
      data = json.load(infile)
      for content in data:
          try:
              city = CityModel(country=content['country'], geonameid=content['geonameid'], name=content['name'], subcountry=content['subcountry'])
              db.session.add(city)
              db.session.commit()
          except Exception as e:
              db.session.rollback()
except Exception as e:
  pass
print('Cities Added')

# For analytics API, we want ot make sure we use the correct model, since the
# underlying logic is all the same here
mapAnalyticsQueryToTable = {"user": RequestsModel.user, "cities": RequestsModel.searchTerm,
                "countries": RequestsModel.country}

# Route to the main page, login screen
@app.route('/')
def ping():
    return app.send_static_file('index.html')

# We decide to return 5 at a time for cities since we don't want to
# return all of the cities at once, generally the user is typing on the
# frontend fast enough to refine the query down
@app.route('/countries/<input>')
def getCityMatches(input):
    cities  = CityModel.query.filter(CityModel.name.contains(input)).limit(5).all()
    arr = []
    for city in cities:
        arr.append(city.to_json())
    return {"cities": arr}


# Here, we decide to write each request we make to the analytics API to a
# new table that we have defined via model to log information about the user
# and the city/country that they have requested.  We can then use this table
# to query analytics information
# Since we are doing a write here, to the analytics table, I did think about trying
# to impelment blocking, but since writes are atomic and there is no possible way
# that two people can have the same primary key for a row (unless uiid has a collision), this is not a worry for me.
@app.route('/forecast/<city>/<days>')
def getForecast(city,days):
    api_url = f"http://api.weatherapi.com/v1/forecast.json?key=dc83cf84d30c434599164146232101&q={city}&days={days}"
    response = requests.get(api_url)
    user = RequestsModel(user=session['userId'], searchTerm = city, uniqueId = str(uuid.uuid4()), country = response.json()['location']['country'])
    db.session.add(user)
    db.session.commit()

    return response.json()


# Fetch all countries in this model.  This should function as a static endpoint
# since the list of countries doesn't change, so I would optimize this to use
# server-side caching via Redis or Memcached in order to prevent too many requests
# going to the DB
@app.route('/allCountries')
def getAllCountries():
    countries = CityModel.query.with_entities(CityModel.country).distinct().all()
    arr = [index[0] for index in countries]
    return {"Countries": arr}

# Fetch all cities within a given country.  # For countries with a lot of cities
# one follow up can be to paginate these results using request parameters to this
# URL
@app.route('/country/<country>')
def getAllCitiesWithCountry(country):
    country = CityModel.query.filter(CityModel.country == country).all()
    arr = [cities.name for cities in country]
    return {f"Cities in {country}": arr}

# The signin page that we have defined. We take in a user and password, query
# the database to see if the password encrypted matches the DB entry and then authenticate with a session cookie
@app.route('/signin', methods=['POST'])
def signin():
    username = json.loads(request.data.decode())['username']
    password = json.loads(request.data.decode())['password']
   
    user  = UserModel.query.filter(UserModel.username == username).all()
    if encrypt(secret_key=secret_key, plain_text=password) == user[0].password:
        session['userId'] = username
        return jsonify({'Success: Cookie': f"{session['userId']}"}), 200
    
    return jsonify({'Invalid Credential'}), 400

# This endpoint is only for user testing, in the long term I would gate this
# endpoint to only work for admins.  I needed to create this flow to create new
# users via UI.
# Since we are doing a write here, I would probably implment blocking for concurrency
# so that two people cannot concurrently create the same username and write to the
# same resource, as well as check
# if a username is already taken before allowing them to create a new one.
@app.route('/signup/<username>/<password>/<fullName>', methods=['POST'])
def signup(username,password,fullName):
    enc_pass = encrypt(secret_key=secret_key, plain_text=password)
    user = UserModel(username=username, password=enc_pass, full_name=fullName)
    db.session.add(user)
    db.session.commit()
    return "Successfully Added"

# Functions as the API for all of our analytics.  We get the count of either top
# users, top countries, or top cities that have been requested based on the
# traffic that has wrote via requesting weather API.  In the longer term, I would
# implement some logic to clear out the table results past a certain value or 
# a window of time so that we don't overload the table with data that may be
# stale and reflect current trends.
@app.route('/top/<param>/<n>')
def topCountries(param,n):
    if param not in mapAnalyticsQueryToTable:
        return {f"Invalid Param ": param}
    
    returned = RequestsModel.query.with_entities(func.count(mapAnalyticsQueryToTable[param]), mapAnalyticsQueryToTable[param])\
    .group_by(mapAnalyticsQueryToTable[param]).order_by(desc(func.count(mapAnalyticsQueryToTable[param]))).limit(n).all()
    arr = makeRet(returned)
    return {f"Top {n} {param}": arr}

def makeRet(arr):
    return [index[1] for index in arr]

