pipeline {
  agent none
  environment {
    REPOSITORY = 'assinador'
    REPOSITORY_PR = 'assinador_pr'
    NEXUS_URL = 'https://artefatosdev.mpes.mp.br'
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
    stage("build .net backend") {
      when { 
        expression { 
          return params.PR_ID != '-1'
        }
      }
      agent {
        docker {
          image 'mcr.microsoft.com/dotnet/core/sdk:2.2'
          reuseNode true
        }
      }
      steps {
        dir('backend') {
          sh 'dotnet publish -o bin -r win-x64'
          stash includes: 'bin/', name: 'backend'
        }
      }
    }
    stage('publish artifacts') {
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
      steps {
        dir('static') {
          unstash 'backend'
        }
        script {
          if (params.PR_ID != '0') {
            sh '''
              sed -i -E 's/(url:\\ \\").+\\"/\\1https\\:\\/\\/assinador\\.apps\\.mpes\\.mp\\.br\\/\\"/g' electron-builder.yml
              '''
          }
        }
        sh 'yarn && yarn release'
        withCredentials([
        usernamePassword(
          credentialsId: 'SVC_NEXUS', 
          passwordVariable: 'password', 
          usernameVariable: 'user')
          ]) {
          script {
            if (params.PR_ID == '0') {
              sh '''
                find installer/ -maxdepth 1 -type f -exec sh -c \
                  'curl -v -f -u $user:$password --upload-file {} ${NEXUS_URL}/repository/${REPOSITORY}/$(basename {})' \\; 
              '''
            } else {
              sh '''
                find installer/ -maxdepth 1 -type f -exec sh -c \
                  'curl -v -f -u $user:$password --upload-file {} ${NEXUS_URL_PR}/repository/${REPOSITORY_PR}/$(basename {})' \\; 
              '''
            }
          }
        }
        cleanWs()
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
