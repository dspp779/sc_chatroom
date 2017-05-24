from django.conf.urls import url

from im import views

urlpatterns = [
    url(r'^login', views.login, name='login'),
    url(r'^message', views.msg_handler, name='message'),
    url(r'^history/csv/(?P<user>.*)', views.msg_history_csv, name='history_csv'),
    url(r'^history/(?P<user>.*)', views.msg_history, name='history'),
]
