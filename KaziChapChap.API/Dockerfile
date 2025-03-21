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

# Copy the entire repository (adjust your .dockerignore to skip unnecessary files)
COPY . .

# Restore dependencies using the API project file (which has relative project references)
RUN dotnet restore "KaziChapChap.API/KaziChapChap.API.csproj"

# Change working directory to the API project folder and build the project
WORKDIR "/src/KaziChapChap.API"
RUN dotnet build "KaziChapChap.API.csproj" -c $configuration -o /app/build

# Stage 3: Publish the application
FROM build AS publish
ARG configuration=Release
WORKDIR "/src/KaziChapChap.API"
RUN dotnet publish "KaziChapChap.API.csproj" -c $configuration -o /app/publish /p:UseAppHost=false

# Stage 4: Final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KaziChapChap.API.dll"]

#docker build -f KaziChapChap.API/Dockerfile -t kazichapchap-api .
#docker run -d -p 5181:5181 --name my-api -e ASPNETCORE_ENVIRONMENT=Development kazichapchap-api
