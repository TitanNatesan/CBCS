# serializers.py
from rest_framework import serializers
from .models import HOD, Student,Course

class HODSerializer(serializers.ModelSerializer):
    class Meta:
        model = HOD
        fields = ['id', 'username', 'password', 'email', 'department']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        hod = HOD.objects.create_user(**validated_data)
        return hod

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'username', 'password', 'email', 'department',"current_semester"]
        extra_kwargs = {'password': {'write_only': True},"current_semester":{'read_only':True}}

    def create(self, validated_data):
        student = Student.objects.create_user(**validated_data)
        return student
    
class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'is_optional', 'semester']
