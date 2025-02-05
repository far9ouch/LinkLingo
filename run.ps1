function Show-Menu {
    Clear-Host
    Write-Host "========================="
    Write-Host "LinkLingo Server Manager"
    Write-Host "========================="
    Write-Host "1: Start Development Server"
    Write-Host "2: Install Dependencies"
    Write-Host "3: Update Project Files"
    Write-Host "4: Exit"
}

function Start-Server {
    if (-Not (Test-Path "node_modules")) {
        Write-Host "Node modules not found. Installing dependencies first..."
        npm install
    }
    node server.js
}

function Install-Dependencies {
    npm install
}

function Update-Files {
    if (-Not (Test-Path "public")) {
        New-Item -ItemType Directory -Path "public"
    }
    Move-Item -Path "index.html" -Destination "public" -Force
    Move-Item -Path "chat.html" -Destination "public" -Force
    Move-Item -Path "style.css" -Destination "public" -Force
    Move-Item -Path "chat.css" -Destination "public" -Force
    Move-Item -Path "chat.js" -Destination "public" -Force
    Write-Host "Files updated successfully!"
}

do {
    Show-Menu
    $selection = Read-Host "Please make a selection"
    switch ($selection) {
        '1' {
            Start-Server
        }
        '2' {
            Install-Dependencies
        }
        '3' {
            Update-Files
        }
    }
    pause
}
until ($selection -eq '4') 