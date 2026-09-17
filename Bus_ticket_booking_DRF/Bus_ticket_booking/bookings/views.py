from django.contrib.auth import get_user_model, authenticate
User = get_user_model()

from rest_framework.authtoken.models import Token
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Bus, Seat, Booking, Payment
from .serializrs import (
    ChangePasswordSerializer, SeatSerializer, BusSerializer,
    BookingSerializer, UserRegisterSerializer, ChangeUsernameSerializer
)
from django.conf import settings
import razorpay


client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_order(request):
    seat_id = request.data.get('seat_id')
    try:
        seat = Seat.objects.get(id=seat_id)
        if seat.is_booked:
            return Response({'error': 'Seat already booked'}, status=status.HTTP_400_BAD_REQUEST)

        amount_in_paise = int(seat.bus.prices * 100)

        razorpay_order = client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": '1'
        })

        payment = Payment.objects.create(
            user=request.user,
            amount=seat.bus.prices,
            order_id=razorpay_order['id'],
            status='created'
        )

        return Response({
            'order_id': razorpay_order['id'],
            'razorpay_key_id': settings.RAZORPAY_KEY_ID,
            'amount': amount_in_paise,
            'payment_id': payment.id
        })

    except Seat.DoesNotExist:
        return Response({'error': 'Seat not found'}, status=status.HTTP_404_NOT_FOUND)

class RegisterView(APIView):
                      
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):  
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key ,'user_id':user.id,'username':user.username}, status=status.HTTP_200_OK)
        else:
          return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
class BusListCreateView(generics.ListCreateAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [AllowAny]

class BusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [AllowAny]

class BookingView(APIView):
    permission_classes = [IsAuthenticated]


    def post(self, request):
        seat_id = request.data.get('seat')
        try:
            seat = Seat.objects.get(id=seat_id)
            if seat.is_booked:
                return Response({'error': 'Seat already booked'}, status=status.HTTP_400_BAD_REQUEST)
            
            seat.is_booked = True
            seat.save()

            bookings = Booking.objects.create(
                user=request.user,
                bus=seat.bus,
                seat=seat
            )
            Serializer = BookingSerializer(bookings)
            return Response(Serializer.data, status=status.HTTP_201_CREATED)
        except Seat.DoesNotExist:
            return Response({'error': 'invalid seat not found'}, status=status.HTTP_404_NOT_FOUND)
        
class UserBookingsView(APIView):
    permission_classes = [IsAuthenticated]


    def get(self, request, user_id):
        if request.user.id != int(user_id):
            return Response({'error': 'unauthorized access'}, status=status.HTTP_401_UNAUTHORIZED)      
        
        bookings = Booking.objects.filter(user_id=user_id)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)
    
class BookingDeletelView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)

            # Only allow owner to delete
            if booking.user != request.user:
                return Response({'error': 'Unauthorized access'}, status=status.HTTP_401_UNAUTHORIZED)
            Seat=booking.seat
            Seat.is_booked = False
            Seat.save()
            # Delete booking
            booking.delete()
            return Response({'message': 'Booking cancelled successfully'}, status=status.HTTP_200_OK)

        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_seats_by_bus(request, bus_id):
        seats = Seat.objects.filter(bus_id=bus_id)
        serializer = SeatSerializer(seats, many=True)
        return Response(serializer.data)
        

class Logout(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'message': 'Logged out successfully'})

    
class ChangeUsernameView(APIView):
     permission_classes = [IsAuthenticated]

     def put(self, request):
        serializer = ChangeUsernameSerializer(
            instance=request.user,        # pass current user
            data=request.data,
            context={'request': request},
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Username updated successfully"},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
     
class ChangePasswordView(APIView):
     permission_classes = [IsAuthenticated]

     def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {"error": "Old password is incorrect"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response(
                {"message": "Password updated successfully"},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
     
