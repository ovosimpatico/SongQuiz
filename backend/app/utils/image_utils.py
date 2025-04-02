from typing import Optional


def get_blurred_image_url(original_url: Optional[str], blur_level: int = 10) -> str:
    """
    Generate a URL for a blurred version of the image.

    In a production environment, this would typically:
    1. Download the image
    2. Apply a blur filter
    3. Save the blurred image
    4. Return a URL to the blurred image

    For this implementation, we'll assume a frontend solution where
    the blur is applied via CSS, and we'll just return the original URL.
    """
    if not original_url:
        # Return a default image URL if the original is None
        return "/static/default-cover.jpg"

    return original_url