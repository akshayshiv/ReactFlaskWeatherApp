from weather_api_service import db


class Requests(db.Model):
    __tablename__ = 'requests'

    user = db.Column(db.String(255), nullable=False)
    searchTerm = db.Column(db.String(255), nullable=False)
    uniqueId = db.Column(db.String(255), primary_key = True, nullable=False)
    country = db.Column(db.String(255), nullable=False)


    def __init__(self, user, searchTerm, uniqueId, country):
        self.user = user
        self.searchTerm = searchTerm
        self.uniqueId = uniqueId
        self.country = country

    def to_json(self):
        return dict(
            user =self.user,
            searchTerm=self.searchTerm,
            uniqueId = self.uniqueId,
            country = self.country,
        )
