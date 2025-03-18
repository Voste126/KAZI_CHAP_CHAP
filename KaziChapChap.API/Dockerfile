# Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5181
ENV ASPNETCORE_URLS=http://+:5181
USER app

# Build stage
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG configuration=Release
WORKDIR /src

# Copy only the project files to leverage Docker layer caching
COPY KaziChapChap.API/KaziChapChap.API.csproj KaziChapChap.API/
COPY KaziChapChap.Core/KaziChapChap.Core.csproj KaziChapChap.Core/
COPY KaziChapChap.Data/KaziChapChap.Data.csproj KaziChapChap.Data/

# Restore dependencies (this uses the csproj files in their proper folders)
RUN dotnet restore KaziChapChap.API/KaziChapChap.API.csproj

# Copy the entire repository (ensuring all source code is available)
COPY . .

# Change to the API project folder and build it
WORKDIR /src/KaziChapChap.API
RUN dotnet build KaziChapChap.API.csproj -c $configuration -o /app/build

# Publish stage
FROM build AS publish
ARG configuration=Release
RUN dotnet publish KaziChapChap.API.csproj -c $configuration -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KaziChapChap.API.dll"]

