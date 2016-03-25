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

im_listen_dict = defaultdict(Queue)
waiting_user_queue = Queue()

# Create your views here.

@never_cache
def msg_handler(request):
    if request.method == 'GET':
        # TODO: assign receiver
        msg = im_listen_dict[request.session['user-id']].get()
        return JsonResponse(msg.to_json())
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