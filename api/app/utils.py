import hashlib
import os


def allowed_file(filename):
    """
    Checks if the format for the file received is acceptable. For this
    particular case, we must accept only image files. This is, files with
    extension ".png", ".jpg", ".jpeg" or ".gif".

    Parameters
    ----------
    filename : str
        Filename from werkzeug.datastructures.FileStorage file.

    Returns
    -------
    bool
        True if the file is an image, False otherwise.
    """
    # Check if the file extension of the filename received is in the set of allowed extensions (".png", ".jpg", ".jpeg", ".gif")
    ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif"}
    
    # Get file extension and convert to lowercase
    _, file_extension = os.path.splitext(filename.lower())
    
    return file_extension in ALLOWED_EXTENSIONS


async def get_file_hash(file):
    """
    Returns a new filename based on the file content using MD5 hashing.
    It uses hashlib.md5() function from Python standard library to get
    the hash.

    Parameters
    ----------
    file : werkzeug.datastructures.FileStorage
        File sent by user.

    Returns
    -------
    str
        New filename based in md5 file hash.
    """
    # Read file content and generate md5 hash (Check: https://docs.python.org/3/library/hashlib.html#hashlib.md5)
    file_content = await file.read()
    md5_hash = hashlib.md5(file_content).hexdigest()

    # Return file pointer to the beginning
    await file.seek(0)

    # Add original file extension
    _, file_extension = os.path.splitext(file.filename)
    new_filename = f"{md5_hash}{file_extension}"

    return new_filename
