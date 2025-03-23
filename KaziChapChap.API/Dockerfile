# Stage 1: Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8012
ENV ASPNETCORE_URLS=http://+:8012
USER app

# Stage 2: Build environment
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG configuration=Release
WORKDIR /src

# Copy each .csproj for faster restore
COPY ["KaziChapChap.API/KaziChapChap.API.csproj", "KaziChapChap.API/"]
COPY ["KaziChapChap.Core/KaziChapChap.Core.csproj", "KaziChapChap.Core/"]
COPY ["KaziChapChap.Data/KaziChapChap.Data.csproj", "KaziChapChap.Data/"]

# Restore the API project (references the other projects)
RUN dotnet restore "KaziChapChap.API/KaziChapChap.API.csproj"

# Copy the rest of the repo
COPY . .

# Build
WORKDIR "/src/KaziChapChap.API"
RUN dotnet build "KaziChapChap.API.csproj" -c $configuration -o /app/build

# Stage 3: Publish
FROM build AS publish
ARG configuration=Release
WORKDIR "/src/KaziChapChap.API"
RUN dotnet publish "KaziChapChap.API.csproj" -c $configuration -o /app/publish /p:UseAppHost=false

# Stage 4: Final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KaziChapChap.API.dll"]

