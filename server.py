import http.server
import socketserver
import json
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(filename='server.log', level=logging.INFO,
                   format='%(asctime)s - %(message)s')

class LoggingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/log-state':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            state = json.loads(post_data.decode('utf-8'))
            
            # Log the state
            logging.info(f"State at {state['timestamp']}:")
            for key, value in state.items():
                if key != 'timestamp':
                    logging.info(f"  {key}: {value}")
            logging.info("-" * 50)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok'}).encode())
            return
            
        return super().do_GET()
    
    def do_GET(self):
        super().do_GET()
        logging.info(f"GET request to {self.path}")
        
    def log_message(self, format, *args):
        logging.info("%s - %s", self.address_string(), format%args)

PORT = 8000
Handler = LoggingHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    logging.info(f"Server started at port {PORT}")
    httpd.serve_forever()
