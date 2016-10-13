# Setup and Configure a New Compute Instance

**from local machine**

Confirm ability to login to new cloud instance as root:
```
INSTANCE_IP=72.2.119.140
ROOT=root@$INSTANCE_IP
ssh $ROOT
```
then as root on the new cloud instance:
```
apt-get update
apt-get install git
```

then exit to return to local machine

## create a user for the app
Generate a random, memorable password using: http://www.textfixer.com/tools/random-words.php

**As root on the cloud instance**:

APP_USER is the name of the user that will run your service, and that username should clearly indicate the service.
Each service should have its own user. 

```
PASSWORD='rumcoastfrost'
APP_USER='people'
echo -e "$PASSWORD\n$PASSWORD\n\n\n\n\n\ny\n" | ssh $ROOT adduser $APP_USER
```

**from local machine**
```
PEOPLE_APP=$APP_USER@$INSTANCE_IP
ssh $PEOPLE_APP
```

## Set up environment variables in separate script
**As user on cloud instance**:
Create ~/.bash_ssh.
Note that bash doesn't use this file, we must reference it ourselves when needed.
```
echo "export NODE_ENV=production-joyent" >> ~/.bash_ssh
// echo "export NODE_PATH=." >> ~/.bash_ssh
```

Add these to ~/.bash_profile
```
echo "source ~/.bash_ssh" >> ~/.bash_profile
```

## Add ssh key to allow app to access GitHub
**As user on cloud instance**:
Create a new ssh key to use a deployment key on GitHub.
This ssh key shouldn't have a password.

The SSH_KEY_FILENAME below should be for one github repo. Change the name to something more descriptive.

```
SSH_KEY_FILENAME=peoplerepo
mkdir ~/.ssh
chmod 700 ~/.ssh
ssh-keygen -t rsa -f .ssh/$SSH_KEY_FILENAME -N ''
```

Then we also need an ssh config file that will automatically select our ssh key file
when we ssh in from our development machines.

```
echo "Host github.com" >>~/.ssh/config
echo "    IdentityFile ~/.ssh/$SSH_KEY_FILENAME" >>~/.ssh/config
```

Then add this key to the repo as a [Deploy Key](https://developer.github.com/guides/managing-deploy-keys/#deploy-keys).


## clone repo as $APP_USER

**from local machine**

logon to the new instance as user $APP_USER
```
ssh $PEOPLE_APP
```
**As user on cloud instance**:

then configure git:
```
git config --global user.name "Peter Snider"
git config --global user.email "snider.peter@gmail.com"
git clone git@github.com:psnider/people-service.git
cd people-service
npm install
```

npm install issued a few warnings, mostly related to typings, including:
```
typings WARN deprecated 10/8/2016: "registry:dt/node#6.0.0+20160914131736" is deprecated (updated, replaced or removed)
```

## launch the server
```
mv components/shared/src/ts/Person.ts components/shared/src/ts/person.ts
npm run build-server
mkdir logs
npm run start-servers
```

## launch the app
```
npm run forever-start-people-service
```

## deploy to Joyent
npm run deploy-production-to-joyent


# Install mongodb on Ubuntu

```
INSTANCE_IP=72.2.119.140
ROOT=root@$INSTANCE_IP
ssh $ROOT
```
then as root on the new cloud instance, following [install-mongodb-on-ubuntu-14.04](https://www.howtoforge.com/tutorial/install-mongodb-on-ubuntu-14.04/):
```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
service mongod restart
```

# Test mongodb install on Ubuntu
```
INSTANCE_IP=72.2.119.140
APP_USER='people'
PEOPLE_APP=$APP_USER@$INSTANCE_IP
ssh $PEOPLE_APP
```
