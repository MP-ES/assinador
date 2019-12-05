pipeline {
  agent none
  environment {
    REPOSITORY = 'assinador'
    NEXUS_URL = 'https://artefatos.mpes.mp.br'
    NEXUS_URL_PR = 'https://artefatosdev.mpes.mp.br'
  }

  options {
    buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '10')
    disableConcurrentBuilds()
    ansiColor('xterm')
  }

  parameters {
    string(name: 'PR_ID', defaultValue: '-1', description: 'Identificador do Pull Request.', trim: true)
  }

  stages {
    stage('preparando agente para build/publish') {
      when { 
        expression { 
          return params.PR_ID != '-1'
        }
      }
      agent {
        docker {
          image 'electronuserland/builder:wine'
          args '-v $WORKSPACE:/project'
          reuseNode true
        }
      }
      stages{
        stage('build electron') {
          steps {
            script {
              if (params.PR_ID != '0') {
                sh '''
                  sed -i -E 's/(url:\\ \\").+\\"/\\1https\\:\\/\\/assinador\\.dev\\.mpes\\.mp\\.br\\/\\"/g' electron-builder.yml
                  '''
              }
            }
            sh 'npm i -g cross-env'
            sh 'npm ci && npm run release'
          }
        }
        stage('publish artifacts'){
          steps {
            script {
              if (params.PR_ID == '0') {
                withCredentials([
                usernamePassword(
                  credentialsId: 'SVC_NEXUS', 
                  passwordVariable: 'password', 
                  usernameVariable: 'user')
                  ]) {
                    sh '''
                      find installer/ -maxdepth 1 -type f -exec sh -c \
                        'curl -v -f -u $user:$password --upload-file {} ${NEXUS_URL}/repository/${REPOSITORY}/$(basename {})' \\; 
                    '''
                  }
              } else {
                withCredentials([
                usernamePassword(
                  credentialsId: 'SVC_NEXUS_DEV', 
                  passwordVariable: 'password', 
                  usernameVariable: 'user')
                  ]) {
                    sh '''
                      find installer/ -maxdepth 1 -type f -exec sh -c \
                        'curl -v -f -u $user:$password --upload-file {} ${NEXUS_URL_PR}/repository/${REPOSITORY}/$(basename {})' \\; 
                    '''
                  }
              }
            }
            cleanWs()
          }
        }
      }
    }
  }

  post {
    failure {
      emailext body: '$DEFAULT_CONTENT',
        recipientProviders: [culprits(), developers()],
        subject: '$DEFAULT_SUBJECT',
        replyTo: '$DEFAULT_REPLYTO',
        to: '$DEFAULT_RECIPIENTS'
    }
  }

}
