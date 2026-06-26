from app.schemas.auth import LoginRequest, RegisterRequest, UserOut


def test_auth_schemas_accept_seeded_local_email_addresses():
    login = LoginRequest(email="Admin@DeepShield.local", password="AdminPass123!")
    register = RegisterRequest(
        email="learner@deepshield.local",
        password="LearnerPass123!",
        full_name="DeepShield Learner",
    )
    user = UserOut(
        id="user-1",
        email="admin@deepshield.local",
        full_name="DeepShield Admin",
        role="admin",
        stats={},
    )

    assert login.email == "admin@deepshield.local"
    assert register.email == "learner@deepshield.local"
    assert user.email == "admin@deepshield.local"
