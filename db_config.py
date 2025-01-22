from flask_login import UserMixin
from peewee import SqliteDatabase, Model, IntegerField, CharField, TextField

# Flask単体で動かす場合は相対パス　Apacheで動かす場合は相対パス
# 絶対パスの場合、ユーザー名やプロジェクト名(ディレクトリ名に注意)
db = SqliteDatabase("db002.sqlite")
# db = SqliteDatabase("/home/@@username@@/@@projectname@@/db002.sqlite")


class User(UserMixin, Model):
    id = IntegerField(primary_key=True)
    name = CharField(unique=True)
    email = CharField(unique=True)
    password = TextField()

    class Meta:
        database = db
        table_name = "users002"


db.create_tables([User])
