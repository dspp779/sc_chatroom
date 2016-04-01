# Chatroom for desert survival task
chatroom for anonymous collaboration on desert survival task.

## Prerequisite
- Essential
  - python
  - django
- Recommended
  - gunicorn
  - eventlet

## Get started
Create a new virtual environment, and clone the repository.
```console
$ virtualenv test1
$ git clone git@github.com:dspp779/sc_chatroom.git
```

Install necessary library from requirement.txt
```console
$ pip install -r requirements.txt
```


Then, you are good to go.

Just enter either one of the following command
```console
$ gunicorn chatroom.wsgi -b 0.0.0.0:5566 --worker-class eventlet
```
or,
```console
$ python manage.py 0.0.0.0:5566
```
