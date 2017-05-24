from __future__ import unicode_literals

from django.db import models

# Create your models here.


class ChatUser(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    age = models.IntegerField()
    gender = models.CharField(max_length=20, default='other')

    @classmethod
    def create(cls, name, age, gender):
        user = cls(name=name, age=int(age), gender=gender)
        return user

    def __unicode__(self):
        return '{}:{}({}|{})'.format(self.id, self.name, self.age, self.gender)

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'age': self.age,
            'gender': self.gender,
            }


class Message(models.Model):
    id = models.AutoField(primary_key=True)
    msg_type = models.CharField(max_length=20, default='none')
    sender = models.ForeignKey(ChatUser, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(ChatUser, on_delete=models.CASCADE, related_name='receiver')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    @classmethod
    def create(cls, msg_type, sender, receiver, content):
        msg = cls(msg_type=msg_type, sender=sender, receiver=receiver, content=content)
        return msg

    def __unicode__(self):
        return '{}:{}'.format(self.sender.name, self.content)

    def to_json(self):
        return {
            'id': self.id,
            'msg_type': self.msg_type,
            'sender': self.sender.to_json(),
            'receiver': self.receiver.to_json(),
            'content': self.content,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            }

