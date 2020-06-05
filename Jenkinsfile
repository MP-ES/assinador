pipeline {
  agent none

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
          return params.PR_ID == 'Não Executar'
        }
      }
      agent {
        docker {
          // image 'registrydev.mpes.mp.br/infra/electronbuilder:latest'
          image 'electronuserland/builder:wine'
          args '-v $WORKSPACE:/project'
        }
      }
      stages{
        stage('build electron') {
          steps {
            dir('electron') {
              script {
                if (params.PR_ID != '0') {
                  sh '''
                    sed -i -E 's/(url:\\ \\").+\\"/\\1https\\:\\/\\/assinador\\.dev\\.mpes\\.mp\\.br\\/\\"/g' electron-builder.yml
                    '''
                }
              }
              sh 'yarn && yarn release -wl'
            }
          }
        }
        stage('publish artifacts'){
          steps {
            dir('electron') {
              script {
                if (params.PR_ID == '0') {
                  withCredentials([
                    sshUserPrivateKey(
                      credentialsId: 'SVC_ASSINADOR', 
                      keyFileVariable: 'keyfile',
                      usernameVariable: 'username')
                    ]) {
                      sshagent(credentials: ['SVC_ASSINADOR']) {
                        sh '''
                            scp -o StrictHostKeyChecking=no installer/assinador-* ${username}@k8snfssrv01.mpes.gov.br:/mnt/assinador
                            scp -o StrictHostKeyChecking=no installer/*.yml ${username}@k8snfssrv01.mpes.gov.br:/mnt/assinador
                          '''
                      }
                    }
                } else {
                  withCredentials([
                    sshUserPrivateKey(
                      credentialsId: 'SVC_ASSINADOR_DEV', 
                      keyFileVariable: 'keyfile',
                      usernameVariable: 'username')
                    ]) {
                      sshagent(credentials: ['SVC_ASSINADOR_DEV']) {
                        sh '''
                            scp -o StrictHostKeyChecking=no installer/assinador-* ${username}@container12.mpes.gov.br:/mnt/assinador
                            scp -o StrictHostKeyChecking=no installer/*.yml ${username}@container12.mpes.gov.br:/mnt/assinador
                          '''
                      }
                    }
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
