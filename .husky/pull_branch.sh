#!/bin/bash
read -p "Do you want to pull the latest changes from the current branch? (y/n): " answer < /dev/tty
if [[ $answer =~ ^[Yy]$ ]]
then
    echo "Pulling latest changes from the current branch."
    branch=$(git branch --show-current)
    git pull origin $branch
else
    echo "Skipping pull."
fi