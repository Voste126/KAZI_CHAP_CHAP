# Stage 1: Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5181
ENV ASPNETCORE_URLS=http://+:5181
USER app

# Stage 2: Build the application
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG configuration=Release
WORKDIR /src

# Copy the entire repository (so we have the .csproj in /src/KaziChapChap.API)
COPY . . 

# Restore dependencies using the API project file
# (Remove the "KaziChapChap.API/" prefix so the .csproj is found at /src/KaziChapChap.API.csproj)
RUN dotnet restore "KaziChapChap.API.csproj"

# Build the project (no need to change WORKDIR, just reference the .csproj again)
RUN dotnet build "KaziChapChap.API.csproj" -c $configuration -o /app/build

# Stage 3: Publish the application
FROM build AS publish
ARG configuration=Release
WORKDIR /src
RUN dotnet publish "KaziChapChap.API.csproj" -c $configuration -o /app/publish /p:UseAppHost=false

# Stage 4: Final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KaziChapChap.API.dll"]

# Build command (example):
# docker build -f KaziChapChap.API/Dockerfile -t kazichapchap-api .
# docker run -d -p 5181:5181 --name my-api -e ASPNETCORE_ENVIRONMENT=Development kazichapchap-api

#docker build -f KaziChapChap.API/Dockerfile -t kazichapchap-api .
#docker run -d -p 5181:5181 --name my-api -e ASPNETCORE_ENVIRONMENT=Development kazichapchap-api
