from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.core import serializers
from models import ChatUser, Message

from collections import defaultdict
from Queue import Queue
import json
import random

im_listen_dict = defaultdict(Queue)
waiting_user_queue = Queue()
profiles = [
	{"gender":"female", "age":18, "path":"TMBfemale18-2neutral.jpg", "name":"Jane"},
	{"gender":"female", "age":19, "path":"TMWfemale19neutral.jpg", "name":"Susan"},
	{"gender":"female", "age":20, "path":"EMBfemale20neutral.jpg", "name":"Patricia"},
	{"gender":"female", "age":21, "path":"EMWfemale21-2neutral.jpg", "name":"Emily"},
	{"gender":"female", "age":22, "path":"WAfemale22neutral.jpg", "name":"Judith"},
	{"gender":"female", "age":25, "path":"EMIfemale25-2neutral.jpg", "name":"Martha"},
	{"gender":"male", "age":18, "path":"TMBmale18neutral.jpg", "name":"Robert"},
	{"gender":"male", "age":19, "path":"WWmale19neutral.jpg", "name":"Kevin"},
	{"gender":"male", "age":20, "path":"EMWmale20neutral.jpg", "name":"Marc"},
	{"gender":"male", "age":21, "path":"WWmale21-3neutral.jpg", "name":"Sam"},
	{"gender":"male", "age":22, "path":"TSFWmale22neutral.jpg", "name":"Adam"},
	{"gender":"male", "age":24, "path":"EMImale24neutral.jpg", "name":"Michael"}
]
# profiles = json.load(open('/static/profiles.json', 'r'))

# Create your views here.

@never_cache
def msg_handler(request):
    if request.method == 'GET':
        msg = im_listen_dict[request.session['user-id']].get()
        msg_json = msg.to_json()
        # generate fake profile
        if msg_json['msg_type'] == 'receiver':
            msg_json['sender'] = _to_fake_profile(msg_json['sender'])
        return JsonResponse(msg_json)
    elif request.method == 'POST':
        sender = ChatUser.objects.get(id=request.session['user-id'])
        msg = json.loads(request.body)
        msg['sender'] =  sender
        msg['receiver'] = ChatUser.objects.get(id=msg['receiver'])
        msg = Message.create(**msg)
        msg.save()
        im_listen_dict[msg.receiver.id].put(msg)
        return JsonResponse(msg.to_json())
    return HttpResponse(status=501)
    
@never_cache
def login(request):
    if request.method == 'GET':
        sender = ChatUser.objects.get(id=request.session['user-id'])
        # TODO: assign receiver
        receiver = ''
        if waiting_user_queue.empty():
            waiting_user_queue.put(sender)
        else:
            receiver = waiting_user_queue.get()
            msg = Message.create(msg_type='receiver', receiver=receiver, sender=sender, content='Hi')
            msg.save()
            im_listen_dict[receiver.id].put(msg)
            receiver = receiver.to_json()
            # generate fake profile
            receiver = _to_fake_profile(receiver)
        return JsonResponse({'receiver':receiver})
    elif request.method == 'POST':
        profile = json.loads(request.body)
        # profile: name, age, gender
        usr = ChatUser.create(**profile)
        usr.save()
        request.session['user-id'] = usr.id
        # request.session['age'] = profile['age']
        # request.session['gender'] = profile['gender']
        return JsonResponse(usr.to_json(), status=201)
    return HttpResponse(status=501)

def _to_fake_profile(receiver):
    fake_profile = random.choice(list(filter(lambda x: x['gender']==receiver['gender'], profiles)))
    fake_profile['id'] = receiver['id']
    return fake_profile

'''  Message Json Object
id
msg_type (Message Type)
    receiver: assign new receiver
    text: text message
    byebye: end conversation
sender (Message Sender)
    info of sender
receiver (Message Receiver)
    info of sender
content (Message Content)
    message content
timestamp (Message Sent Time)
    message time set by server
'''