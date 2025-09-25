# LMS Deployment Guide

## Production Deployment Options

### 1. Docker Deployment (Recommended)

#### Prerequisites
- Docker and Docker Compose installed
- Domain name configured (optional)
- SSL certificates (for HTTPS)

#### Quick Start
```bash
# Clone the repository
git clone <your-repo-url>
cd lms-project

# Build and start containers
docker-compose up -d

# Check logs
docker-compose logs -f
```

#### Environment Configuration
Update `docker-compose.yml` with your production values:
- `MONGODB_URI`: Your MongoDB connection string
- `SESSION_SECRET`: Strong random secret key
- `ALLOWED_ORIGINS`: Your domain(s)

### 2. Cloud Platform Deployment

#### AWS Deployment
1. **Elastic Beanstalk**:
   ```bash
   # Install EB CLI
   pip install awsebcli
   
   # Initialize and deploy
   eb init
   eb create production
   eb deploy
   ```

2. **ECS with Fargate**:
   - Push Docker image to ECR
   - Create ECS task definition
   - Deploy to Fargate cluster

#### Google Cloud Platform
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/lms-app

# Deploy to Cloud Run
gcloud run deploy lms-app \
  --image gcr.io/PROJECT_ID/lms-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure Container Instances
```bash
# Create resource group
az group create --name lms-rg --location eastus

# Deploy container
az container create \
  --resource-group lms-rg \
  --name lms-app \
  --image your-registry/lms-app:latest \
  --dns-name-label lms-app \
  --ports 5000
```

### 3. Traditional Server Deployment

#### Prerequisites
- Node.js 18+ installed
- PM2 for process management
- Nginx for reverse proxy

#### Steps
```bash
# Install dependencies
cd server && npm install --production
cd ../frontend && npm install && npm run build

# Install PM2
npm install -g pm2

# Start application
pm2 start server/server.js --name lms-app

# Configure PM2 startup
pm2 startup
pm2 save
```

## Security Configuration

### Environment Variables
Create `.env` file in server directory:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_super_secret_key
SESSION_NAME=lms_session
ALLOWED_ORIGINS=https://yourdomain.com
MAX_FILE_SIZE=50MB
UPLOAD_PATH=./uploads
```

### SSL/HTTPS Setup
1. Obtain SSL certificates (Let's Encrypt recommended)
2. Configure nginx with SSL
3. Update ALLOWED_ORIGINS to use HTTPS

### Database Security
- Use MongoDB Atlas with IP whitelisting
- Enable authentication
- Use connection string with credentials
- Regular backups

## Monitoring and Maintenance

### Health Checks
- Endpoint: `GET /api/health`
- Returns: `{"status": "OK", "timestamp": "..."}`

### Logging
- Application logs via console
- Access logs via nginx
- Error tracking with services like Sentry

### Backup Strategy
1. **Database**: MongoDB Atlas automatic backups
2. **Files**: Regular backup of uploads directory
3. **Code**: Git repository with tags for releases

## Performance Optimization

### Frontend
- Gzip compression enabled
- Static asset caching
- CDN for file uploads (optional)

### Backend
- Connection pooling for MongoDB
- Session store optimization
- Rate limiting configured

### Database
- Proper indexing on frequently queried fields
- Connection pooling
- Query optimization

## Scaling Considerations

### Horizontal Scaling
- Load balancer (nginx/AWS ALB)
- Multiple application instances
- Shared session store (Redis)

### Vertical Scaling
- Increase server resources
- Database performance tuning
- File storage optimization

## Troubleshooting

### Common Issues
1. **MongoDB Connection**: Check connection string encoding
2. **File Uploads**: Verify upload directory permissions
3. **CORS Errors**: Check ALLOWED_ORIGINS configuration
4. **Session Issues**: Verify SESSION_SECRET and MongoDB connection

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development npm start
```

### Container Logs
```bash
# View application logs
docker-compose logs lms-app

# Follow logs in real-time
docker-compose logs -f lms-app
```

## Support and Updates

### Version Updates
1. Test in staging environment
2. Backup database and files
3. Deploy new version
4. Run database migrations if needed
5. Verify functionality

### Security Updates
- Regular dependency updates
- Security patches
- SSL certificate renewal
- Access log monitoring