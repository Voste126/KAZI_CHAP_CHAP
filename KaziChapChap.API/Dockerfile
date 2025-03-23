FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5181

ENV ASPNETCORE_URLS=http://+:5181

USER app
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG configuration=Release
WORKDIR /src
COPY ["KaziChapChap.API/KaziChapChap.API.csproj", "KaziChapChap.API/"]
COPY ["KaziChapChap.Data/KaziChapChap.Data.csproj", "KaziChapChap.Data/"]
COPY ["KaziChapChap.Core/KaziChapChap.Core.csproj", "KaziChapChap.Core/"]

RUN dotnet restore "KaziChapChap.API/KaziChapChap.API.csproj"
COPY . .
WORKDIR "/src/KaziChapChap.API"
RUN dotnet build "KaziChapChap.API.csproj" -c $configuration -o /app/build

FROM build AS publish
ARG configuration=Release
RUN dotnet publish "KaziChapChap.API.csproj" -c $configuration -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KaziChapChap.API.dll"]
