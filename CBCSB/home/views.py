from django.shortcuts import render
from rest_framework import generics,status
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.contrib.auth import authenticate,login
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny,IsAuthenticated

from . import models, serializers

# Create your views here.

@api_view(["GET"])
def test(request):
    return Response({"message":"Hello World"})

class Login(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            cont = {}
            if models.HOD.objects.filter(username=username).exists():
                cont['user_type'] = 'HOD'
            elif models.Student.objects.filter(username=username).exists():
                cont['user_type'] = 'Student'
            else:
                cont['user_type'] = 'Admin'
            
            token, created = Token.objects.get_or_create(user=user)
            cont['token'] = token.key
            cont['id'] = user.id
            cont['username'] = user.username
            return Response(cont, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

class HODRegisterView(generics.CreateAPIView):
    queryset = models.HOD.objects.all()
    serializer_class = serializers.HODSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            department_id = request.data.get('department')
            department = get_object_or_404(models.Department, id=department_id)
            instance = serializer.save(department=department)
            return Response({
                "message": "Head of Department created successfully.",
                "id": instance.id,
                "username": instance.username,
                "department": instance.department.name
            }, status=status.HTTP_201_CREATED)
        except models.Department.DoesNotExist:
            return Response({"error": "Department does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class StudentRegisterView(generics.CreateAPIView):
    queryset = models.Student.objects.all()
    serializer_class = serializers.StudentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            dep_id = request.data.get('department')
            department = get_object_or_404(models.Department, id=dep_id)
            instance = serializer.save(department=department)
            return Response({
                "message": "Student created successfully.",
                "id": instance.id,
                "username": instance.username,
                "department": instance.department.name
            }, status=status.HTTP_201_CREATED)
        except models.Department.DoesNotExist:
            return Response({"error": "Program does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def getStudents(request):
    if request.method == "GET":
        students = models.Student.objects.all()
        serializer = serializers.StudentSerializer(students, many=True)
        return Response(serializer.data)

class CourseView(generics.ListCreateAPIView):
    queryset = models.Course.objects.all()
    serializer_class = serializers.CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        user = self.request.user
        
        if hasattr(user, 'hod'):
            department = user.hod.department
        else:
            raise serializers.ValidationError("User is not associated with a department.")
        
        serializer.save(department=department)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getCourses(request):
    if request.method == "GET" and models.Student.objects.filter(username=request.user.username).exists():
        user = models.Student.objects.get(username=request.user.username)
        courses = models.Course.objects.filter(department=user.department)
        serial = serializers.CourseSerializer(courses,many=True)
        return Response(serial.data)
        # return Response("Hi")