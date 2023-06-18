from weather_api_service import db


class User(db.Model):
    __tablename__ = 'users'
    username = db.Column(db.String(255), primary_key=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    full_name = db.Column(db.String(255), nullable=False)

    def __init__(self, username, password, full_name):
        self.username = username
        self.password = password
        self.full_name = full_name

    def to_json(self):
        return dict(
            username=self.username,
            full_name=self.full_name
        )
