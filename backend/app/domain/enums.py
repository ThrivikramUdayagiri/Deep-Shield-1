from enum import Enum


class StringEnum(str, Enum):
    pass


class ScenarioType(StringEnum):
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    QR_CODE = "qr_code"
    WEBSITE = "website"


class TruthLabel(StringEnum):
    FAKE = "fake"
    GENUINE = "genuine"


class UserRole(StringEnum):
    LEARNER = "learner"
    ADMIN = "admin"


class TrainingMode(StringEnum):
    QUICK = "quick"
    TEXT_ONLY = "text_only"
    MULTIMODAL = "multimodal"
    WEAKNESS_DRILL = "weakness_drill"
    ADVANCED = "advanced"
