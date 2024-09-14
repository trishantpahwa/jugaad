#!/bin/bash

branch=$(git branch --show-current)
remote_branch_exists=$(git ls-remote --exit-code --heads origin $branch >/dev/null 2>&1; echo $?)

if [[ $remote_branch_exists -eq 0 ]]; then
    read -p "Do you want to pull the latest changes from the current branch? (y/n): " answer < /dev/tty
    if [[ $answer =~ ^[Yy]$ ]]; then
        echo "Pulling latest changes from the current branch."
        git pull origin $branch
    else
        echo "Skipping pull."
    fi
else
    echo "The branch $branch does not exist on the remote server."
fi