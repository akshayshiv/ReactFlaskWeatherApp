from weather_api_service import db


class City(db.Model):
    __tablename__ = 'cities'

    country = db.Column(db.String(255),  nullable=False)
    geonameid = db.Column(db.String(255), primary_key=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    subcountry=db.Column(db.String(255), nullable=False)

    def __init__(self, country, geonameid, name, subcountry):
        self.country = country
        self.geonameid = geonameid
        self.name = name
        self.subcountry = subcountry

    def to_json(self):
        return dict(
            geonameid =self.geonameid,
            name=self.name,
            subcountry = self.subcountry,
            country = self.country,
        )
