pipeline {
    agent any

    environment {
        IMAGE_NAME = 'api_nosql_service'
        CONTAINER_NAME = 'api_nosql_service'
        REPO_URL = 'https://github.com/estefanirup/api-colmeias'
        EMAIL = 'osvaldo.beltrame.neto@gmail.com'
    }

    triggers {
        cron('H 3 * * *') // Executa todos os dias por volta das 3h
    }

    stages {
        stage('Clonar repositório') {
            steps {
                git branch: 'main', url: "${REPO_URL}"
            }
        }

        stage('Remover container/imagem antigos') {
            steps {
                sh """
                    docker rm -f ${CONTAINER_NAME} || true
                    docker rmi -f ${IMAGE_NAME} || true
                """
            }
        }

        stage('Build da imagem') {
            steps {
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Criar e iniciar container') {
            steps {
                sh """
                    docker run -d --name ${CONTAINER_NAME} -p 3000:3000 ${IMAGE_NAME}
                """
            }
        }
    }

    post {
        success {
            mail to: "${EMAIL}",
                 subject: "Deploy bem-sucedido - ${IMAGE_NAME}",
                 body: "O job da API ${IMAGE_NAME} foi executado com sucesso."
        }
        failure {
            mail to: "${EMAIL}",
                 subject: "Falha no Deploy - ${IMAGE_NAME}",
                 body: "O job da API ${IMAGE_NAME} falhou. Verifique os logs no Jenkins."
        }
    }
}
