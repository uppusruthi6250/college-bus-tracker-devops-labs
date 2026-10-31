
pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        BACKEND_IMAGE = 'college-bus-tracker-backend'
        FRONTEND_IMAGE = 'college-bus-tracker-frontend'
        NAMESPACE = 'bus-tracker'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate Tools') {
            steps {
                bat 'docker --version'
                bat 'kubectl version --client'
            }
        }

        // Build backend image with development dependencies for testing
        stage('Build Backend Test Image') {
            steps {
                bat '''
                    docker build --target test -f Dockerfile.backend -t %BACKEND_IMAGE%:test .
                '''
            }
        }

        // Run backend integration tests
        stage('Backend Integration Tests') {
            steps {
                bat '''
                    docker run --rm %BACKEND_IMAGE%:test
                '''
            }
        }

        // Build production backend image
        stage('Build Backend Docker Image') {
            steps {
                bat '''
                    docker build --target production -f Dockerfile.backend -t %BACKEND_IMAGE%:build .
                '''
            }
        }

        // Build frontend image
        stage('Build Frontend Docker Image') {
            steps {
                bat '''
                    docker build -f Dockerfile.frontend -t %FRONTEND_IMAGE%:build .
                '''
            }
        }

        // Push backend and frontend images to Docker Hub
        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_TOKEN'
                    )
                ]) {
                    bat '''
                        @echo off

                        echo %DOCKER_TOKEN% | docker login -u %DOCKER_USER% --password-stdin
                        if errorlevel 1 exit /b 1

                        docker tag %BACKEND_IMAGE%:build %DOCKER_USER%/%BACKEND_IMAGE%:%BUILD_NUMBER%
                        docker tag %FRONTEND_IMAGE%:build %DOCKER_USER%/%FRONTEND_IMAGE%:%BUILD_NUMBER%

                        docker push %DOCKER_USER%/%BACKEND_IMAGE%:%BUILD_NUMBER%
                        if errorlevel 1 exit /b 1

                        docker push %DOCKER_USER%/%FRONTEND_IMAGE%:%BUILD_NUMBER%
                        if errorlevel 1 exit /b 1

                        docker logout
                    '''
                }
            }
        }

        // Deploy application to Kubernetes
        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_TOKEN'
                    ),
                    string(
                        credentialsId: 'bus-tracker-jwt-secret',
                        variable: 'JWT_SECRET'
                    )
                ]) {
                    bat '''
                        @echo off

                        kubectl apply -f k8s\\namespace.yaml
                        if errorlevel 1 exit /b 1

                        kubectl create secret generic bus-tracker-secrets ^
                          --namespace=bus-tracker ^
                          --from-literal=JWT_SECRET="%JWT_SECRET%" ^
                          --dry-run=client -o yaml | kubectl apply -f -
                        if errorlevel 1 exit /b 1

                        kubectl apply -k k8s
                        if errorlevel 1 exit /b 1

                        kubectl set image deployment/bus-tracker-backend ^
                          backend=%DOCKER_USER%/%BACKEND_IMAGE%:%BUILD_NUMBER% ^
                          initialize-sqlite-schema=%DOCKER_USER%/%BACKEND_IMAGE%:%BUILD_NUMBER% ^
                          -n bus-tracker
                        if errorlevel 1 exit /b 1

                        kubectl set image deployment/bus-tracker-frontend ^
                          frontend=%DOCKER_USER%/%FRONTEND_IMAGE%:%BUILD_NUMBER% ^
                          -n bus-tracker
                        if errorlevel 1 exit /b 1

                        kubectl rollout status deployment/bus-tracker-backend -n bus-tracker --timeout=180s
                        if errorlevel 1 exit /b 1

                        kubectl rollout status deployment/bus-tracker-frontend -n bus-tracker --timeout=180s
                        if errorlevel 1 exit /b 1
                    '''
                }
            }
        }

        // Verify Kubernetes deployment
        stage('Verify Kubernetes Deployment') {
            steps {
                bat 'kubectl get deployments -n bus-tracker'
                bat 'kubectl get pods -n bus-tracker'
                bat 'kubectl get services -n bus-tracker'
            }
        }
    }

    post {
        success {
            echo 'College Bus Tracker CI/CD completed successfully!'
            echo 'Docker images pushed and application deployed to Kubernetes.'
        }

        failure {
            echo 'CI/CD failed. Check the Jenkins Console Output.'
        }
    }
}
