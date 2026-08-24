class CogniFlowError(Exception):
    def __init__(self, message: str, details: str | None = None):
        super().__init__(message)
        self.message = message
        self.details = details

class ConfigurationError(CogniFlowError): pass
class GeminiServiceError(CogniFlowError): pass
class ContentAnalysisError(CogniFlowError): pass
class ProcessingError(CogniFlowError): pass
class SceneGenerationError(CogniFlowError): pass
