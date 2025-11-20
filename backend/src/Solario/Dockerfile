# build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# copy csproj and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore

# copy everything and publish
COPY . .
RUN dotnet publish -c Release -o /app/publish

# runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# optional: set ASP.NET to listen on all network interfaces
ENV ASPNETCORE_URLS=http://+:5000

COPY --from=build /app/publish ./

EXPOSE 5000

ENTRYPOINT ["dotnet", "Solario.dll"]
