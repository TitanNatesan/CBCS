from django.urls import path
from . import views

urlpatterns = [
    path("", views.test, name="test"),
    path("login/", views.Login.as_view(), name="login"),
    path("hod/register/", views.HODRegisterView.as_view(), name="hod-register"),
    path('student/register/', views.StudentRegisterView.as_view(), name='student-register'),
    path('students/', views.getStudents, name='student-list'),
    path("update_course/",views.CourseView.as_view(),name="update-course"),
    path("selectcourse/",views.getCourses,name="Get Courses"),
]
