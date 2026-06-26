from app.application.achievement_service import AchievementService


def test_achievement_service_unlocks_expected_badges():
    stats = {
        "attempts": 5,
        "correct": 5,
        "best_streak": 3,
        "reasoning_average": 0.82,
        "by_type": {
            "text": {"attempts": 2},
            "image": {"attempts": 1},
            "audio": {"attempts": 2},
        },
        "achievements": [],
    }

    achievements = AchievementService().evaluate(stats)
    ids = {achievement["id"] for achievement in achievements}

    assert {"first_signal", "five_correct", "streak_three", "reasoning_detective", "multimodal_explorer"} <= ids
