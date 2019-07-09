pipeline {
  agent none
  environment {
    NEXUS_DEV_CREDENTIALS = 'NEXUS_DEV_CREDENTIALS'
    NEXUS_REPOSITORY = 'assinador'
    NEXUS_URL = 'http://pc63117-linux.mpes.gov.br:8081'
  }

  options {
    buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '10')
    disableConcurrentBuilds()
    ansiColor('xterm')
  }

  stages {
    stage("build .net backend") {
      agent {
        docker {
          image 'mcr.microsoft.com/dotnet/core/sdk:2.2'
          reuseNode false
        }
      }
      steps {
        dir('backend') {
          sh 'dotnet publish -o bin -r win-x64'
          stash includes: 'bin/', name: 'backend'
        }
      }
    }
    stage('Deploy') {
      agent {
        docker {
          image 'electronuserland/builder:wine'
          args '-v $WORKSPACE:/project'
          reuseNode false
        }
      }
      steps {
        dir('static') {
          unstash 'backend'
        }
        sh 'yarn && yarn dist'
        dir('installer') {
          withCredentials([file(credentialsId: "$NEXUS_DEV_CREDENTIALS", variable: 'credentials')]) {
            sh  '''
                for f in *.exe; do \
                  curl -v -u $credentials \
                  --upload-file $f \
                  ${NEXUS_URL}/repository/${NEXUS_REPOSITORY}/$f; \
                done
                curl -v -u $credentials \
                  --upload-file latest.yml \
                  ${NEXUS_URL}/repository/${NEXUS_REPOSITORY}/latest.yml
                '''
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
