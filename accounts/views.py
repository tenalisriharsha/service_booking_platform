from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import api_view, permission_classes

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=False)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response({'success': 'User registered successfully'}, status=status.HTTP_201_CREATED, headers=headers)

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        # Debug print (remove or comment out in production)
        print("LOGIN ATTEMPT:", username, password)

        # Make sure user exists (case insensitive)
        try:
            user = User.objects.get(username__iexact=username)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials (username not found)'}, status=400)

        # Use Django's check_password
        if not user.check_password(password):
            return Response({'error': 'Invalid credentials (password)'}, status=400)

        if not user.is_active:
            return Response({'error': 'User account is inactive'}, status=400)

        # Now get or create token
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'role': getattr(user, 'role', 'user'),
            'timezone': getattr(user, 'timezone', 'UTC')
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_authenticated_user(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': getattr(user, 'role', 'user'),
        'timezone': getattr(user, 'timezone', 'UTC')
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_client_by_id(request, id):
    try:
        client = User.objects.get(id=id, role='client')
        return Response({
            'id': client.id,
            'username': client.username,
            'email': client.email
        })
    except User.DoesNotExist:
        return Response({'error': 'Client not found'}, status=404)