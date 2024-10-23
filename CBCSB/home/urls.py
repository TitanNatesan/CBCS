from django.urls import path
from . import views

urlpatterns = [
    path("", views.test, name="test"),
    path("login/", views.Login.as_view(), name="login"),
    path("hod/register/", views.HODRegisterView.as_view(), name="hod-register"),
    path("student/register/",views.StudentRegisterView.as_view(),name="student-register",),
    path("students/", views.getStudents, name="student-list"),
    path("courses/", views.CourseView.as_view(), name="update-course"),
    path("selectcourse/<int:sem>/", views.selectCourses, name="Select Courses"),
    path("getdetails/", views.getUpSemWithStudDetail, name="Semester with Student Detail"),
    path("getdetails/<int:sid>/", views.getUpSemWithStudDetailHOD, name="Semester with Student Detail for HOD"),
    path("getCourses/",views.getCourses,name="GetCourses"),
    path("programs/",views.programs,name="Programs"),
    path("adminDash/",views.adminDashBoard),
    path("studentblukregister/",views.StudentRegisterBulk.as_view(),name="student-register-bluk",),
    # path("studDash/"),
]