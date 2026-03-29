"""简单的测试端点"""

def handler(request):
    return {
        "statusCode": 200,
        "body": '{"status":"ok","message":"Backend is running"}'
    }
