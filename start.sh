#!/bin/bash

case "$1" in
    --status|status)
        echo "📊 Service Status:"
        docker-compose ps
        ;;
    --logs|logs)
        echo "📝 Viewing logs (Ctrl+C to exit)..."
        docker-compose logs -f
        ;;
    --stop|stop)
        echo "🛑 Stopping all services..."
        docker-compose down
        echo "✅ Services stopped"
        ;;
    --restart|restart)
        echo "🔄 Restarting services..."
        docker-compose restart
        echo "✅ Services restarted"
        ;;
    --rebuild|rebuild)
        echo "🔨 Rebuilding all services..."
        docker-compose down
        docker-compose up -d --build
        echo "✅ Services rebuilt and started"
        ;;
    --help|help)
        echo "Ks Financial App - Docker Control"
        echo ""
        echo "Usage: ./start.sh [option]"
        echo ""
        echo "Options:"
        echo "  (no option)     Start all services"
        echo "  --status        Show service status"
        echo "  --logs          View service logs"
        echo "  --stop          Stop all services"
        echo "  --restart       Restart services"
        echo "  --rebuild       Rebuild and restart"
        echo "  --help          Show this help"
        echo ""
        echo "Access:"
        echo "  Frontend: http://localhost:5173"
        echo "  Backend:  http://localhost:8000"
        echo "  Database: localhost:5432"
        ;;
    *)
        # Default: start all services
        exec /bin/bash /home/avekedoy/Ks_Financial-App/start.sh
        ;;
esac
