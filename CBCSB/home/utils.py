import socket

def get_ip_address():
    try:
        # Create a socket connection
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Connect to an external server (Google's DNS server in this case)
        s.connect(("8.8.8.8", 80))
        # Get the local IP address
        ip_address = s.getsockname()[0]
    finally:
        s.close()
    
    return ip_address