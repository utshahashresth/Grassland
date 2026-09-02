from rest_framework_simplejwt.views import TokenObtainPairView

from .serializer import RoleTokenObtainPairSerializer


class RoleTokenObtainPairView(TokenObtainPairView):
    serializer_class = RoleTokenObtainPairSerializer