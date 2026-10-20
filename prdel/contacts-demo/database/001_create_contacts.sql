-- SQL Server: spusť v databázi ContactsDemo; neprovádí DROP ani mazání dat.
IF OBJECT_ID(N'dbo.Contacts', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Contacts
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Contacts PRIMARY KEY,
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NOT NULL,
        Phone NVARCHAR(40) NOT NULL,
        CreatedUtc DATETIME2(0) NOT NULL CONSTRAINT DF_Contacts_CreatedUtc DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_Contacts_FirstName_NotBlank CHECK (LEN(LTRIM(RTRIM(FirstName))) > 0),
        CONSTRAINT CK_Contacts_LastName_NotBlank CHECK (LEN(LTRIM(RTRIM(LastName))) > 0),
        CONSTRAINT CK_Contacts_Phone_NotBlank CHECK (LEN(LTRIM(RTRIM(Phone))) > 0)
    );
END;
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Contacts') AND name = N'IX_Contacts_Name')
    CREATE INDEX IX_Contacts_Name ON dbo.Contacts (LastName, FirstName, Id);
GO
