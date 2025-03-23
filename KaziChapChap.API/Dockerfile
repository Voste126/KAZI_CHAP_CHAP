# Stage 1: Base runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5181
ENV ASPNETCORE_URLS=http://+:5181
USER app

# Stage 2: Build environment
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG configuration=Release
WORKDIR /src

# Copy the entire repo into /src
# (We can do this because our build context is the repo root)
COPY . .  

# Restore the solution from the repo root
RUN dotnet restore "KAZI_CHAP_CHAP.sln"

# Build the solution
RUN dotnet build "KAZI_CHAP_CHAP.sln" -c $configuration -o /app/build

# Stage 3: Publish
FROM build AS publish
ARG configuration=Release
WORKDIR /src
RUN dotnet publish "KAZI_CHAP_CHAP.sln" -c $configuration -o /app/publish /p:UseAppHost=false

# Stage 4: Final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KaziChapChap.API.dll"]

#docker build -f KaziChapChap.API/Dockerfile -t kazichapchap-api .
#docker run -d -p 5181:5181 --name my-api -e ASPNETCORE_ENVIRONMENT=Development kazichapchap-api
