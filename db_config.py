from flask_login import UserMixin
from peewee import SqliteDatabase, Model, IntegerField, CharField, TextField

db = SqliteDatabase("db002.sqlite")


class User(UserMixin, Model):
    id = IntegerField(primary_key=True)
    name = CharField(unique=True)
    email = CharField(unique=True)
    password = TextField()

    class Meta:
        database = db
        table_name = "users002"


db.create_tables([User])
