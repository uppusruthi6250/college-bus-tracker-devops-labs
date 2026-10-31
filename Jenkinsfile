pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm --prefix backend ci'
                        sh 'npm --prefix frontend ci'
                    } else {
                        bat 'npm --prefix backend ci'
                        bat 'npm --prefix frontend ci'
                    }
                }
            }
        }

        stage('Backend integration tests') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm --prefix backend test'
                    } else {
                        bat 'npm --prefix backend test'
                    }
                }
            }
        }

        stage('Frontend tests') {
            steps {
                echo 'No standalone frontend test script is configured; the production build validates the frontend.'
            }
        }

        stage('Frontend production build') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm --prefix frontend run build'
                    } else {
                        bat 'npm --prefix frontend run build'
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'College Bus Tracker CI completed successfully.'
        }
        failure {
            echo 'College Bus Tracker CI failed. Review the failing stage output above.'
        }
        always {
            archiveArtifacts artifacts: 'frontend/dist/**', allowEmptyArchive: true
        }
    }
}
