from flask import request, make_response
from weather_api_service import app, db, secret_key, getResponseHeaders
from weather_api_service.models.HttpResponse import HttpResponse
import json
from weather_api_service.services import User as user_service
import jwt


@app.route('/login', methods=['POST'])
def login():
    try:
        payload: dict = request.json
        user_name: str = payload.get('user_name', None)
        password: str = payload.get('password', None)
        if user_name and password:
            status, message, data = user_service.validate_user_credentials(user_name=user_name, password=password)
            if status == 200:
                access_token = jwt.encode(payload=data, key=secret_key)
                data['access_token'] = access_token
        else:
            status, message, data = (400, 'Bad request', None)

        response = HttpResponse(message=message, status=status, data=data)
    except Exception as e:
        exception_str = str(e)
        response = HttpResponse(message='Exception Occured - ' + exception_str, status=500)

    return make_response(json.dumps(response.__dict__), response.status, getResponseHeaders())
