# Stage 1: Base runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5181
ENV ASPNETCORE_URLS=http://+:5181
USER app

# Stage 2: Build environment
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG configuration=Release

# We'll copy the entire repository so the other projects are present
WORKDIR /src

# Go up one directory to copy everything (assuming Dockerfile is in KaziChapChap.API)
COPY ../ . 

# Restore the entire solution that references all subprojects
# e.g., if your main solution is "KAZI_CHAP_CHAP.sln"
RUN dotnet restore "KAZI_CHAP_CHAP.sln"

# Build the solution
RUN dotnet build "KAZI_CHAP_CHAP.sln" -c $configuration -o /app/build

# Stage 3: Publish
FROM build AS publish
ARG configuration=Release
WORKDIR /src
RUN dotnet publish "KAZI_CHAP_CHAP.sln" -c $configuration -o /app/publish /p:UseAppHost=false

# Stage 4: Final
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KaziChapChap.API.dll"]

# Build command (example):
# docker build -f KaziChapChap.API/Dockerfile -t kazichapchap-api .
# docker run -d -p 5181:5181 --name my-api -e ASPNETCORE_ENVIRONMENT=Development kazichapchap-api

#docker build -f KaziChapChap.API/Dockerfile -t kazichapchap-api .
#docker run -d -p 5181:5181 --name my-api -e ASPNETCORE_ENVIRONMENT=Development kazichapchap-api
