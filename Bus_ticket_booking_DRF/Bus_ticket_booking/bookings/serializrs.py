from rest_framework import serializers
from .models import  Seat, Booking,Bus
from django.contrib.auth.models import User



class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']
       
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id','seat_number', 'is_booked']

class BusSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)
    class Meta:
        model = Bus
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    bus = serializers.StringRelatedField()
    seat = SeatSerializer(read_only=True)
    user= serializers.StringRelatedField()

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['id','user', 'booking_date', 'bus', 'seat']
        
class logoutSerializer(serializers.Serializer):
    def validate(self, attrs):
        return attrs
    
class ChangeUsernameSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username']

    def validate_username(self, value):
        user = self.context['request'].user

        # Check if username already exists (except current user)
        if User.objects.exclude(id=user.id).filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")

        return value

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)