# File Name Support in Applications

Peter Occil

The issue of supporting file names is tricky, because different file systems&mdash;

- support different character encodings,
- use different rules in the storage of file names,
- use different rules for case comparisons and normalization comparisons, and
- have different limits on the number of code units a file name can have.

For example, by default&mdash;

- NTFS does case-sensitive comparisons of file names, but preserves the case of file names it stores;
- ext2 does a case-insensitive comparison of file names, and
- HFS Plus uses a particular normalization form in file name storage.

Most but not all modern file systems support file names with _non-basic code points_ (names with code points beyond the Basic Latin range of the Unicode Standard).  Such file names are called _internationalized file names_ here.

Applications that wish to support internationalized file names can follow the suggestions below.

### Suggestions for User-Facing Files

User-facing files are files created by end users or introduced into the application by end users.  End users may want to name files in their language, making it necessary for many applications to support internationalized file names.

The MailLib library includes a [`MakeFilename`](https://peteroupc.github.io/MailLib/docs/PeterO.Mail.ContentDisposition.html#MakeFilename_string) method that converts a title or file name to a suitable name for saving data to a file.  `MakeFilename` does a number of things to maximize the chance that the name can be used as is in most file systems.

In one possible use of `MakeFilename`, a word-processing application could create a file name for a document by taking the document's title or the first few words of its body and adding a file extension like ".document" to those words (e.g., "My Report.document"), then pass that name to the `MakeFilename` method to get a suggested file name to show a user seeking to save that document.

`MakeFilename` should not be used to prepare file names of existing files for the purpose of reading them or overwriting them.

### Suggestions for Non-User-Facing Files

Internal files are files used by the application only and not exposed to end users.

To maximize compatibility with file system conventions, applications should limit the names of internal files to names that have the following characters and are left unchanged by the [`MakeFilename`](https://peteroupc.github.io/MailLib/docs/PeterO.Mail.ContentDisposition.html#MakeFilename_string) method:

- Basic lower-case letters (U+0061 to U+007A).
- Basic digits (U+0030 to U+0039).
- Hyphen, underscore, full stop ("-", "_", ".").

In addition, such file names should not begin or end with "-" or "." or have two or more consecutive full stops ("."). (Basic upper-case letters, U+0041 to U+005a, are not suggested here because different file systems have different rules for case comparisons.)

Applications should avoid giving internal files an internationalized file name without a compelling reason to do so.  This is especially because there are ways to encode such file names in this restricted character set, one of which is to&mdash;
- put the internationalized string [in UTF-8](https://peteroupc.github.io/MailLib/docs/PeterO.DataUtilities.html#GetUtf8Bytes_string_bool) (an 8-bit encoding form of the Unicode Standard), then
- encode the UTF-8 bytes using lowercase base16 or lowercase base32 without padding (RFC 4648).

### File Name Length Limits

Different file systems have different limits in the sizes of file names.  To maximize compatibility with different file system limits, applications should avoid using file names longer than&mdash;

- 255 Unicode code points, if the names are limited to the basic characters given in the previous section, or
- 63 Unicode code points, otherwise.

(MS-DOS supported only file names with up to 8 bytes, followed optionally by "." and up to three more bytes, and with no more than one ".".  Such a limit almost never occurs in practice today.)

### Normalization and HFS Plus

The issue of normalization can come into play if an application supports internationalized file names.

The string returned by `MakeFilename` is normalized using Unicode normalization form C (NFC) (see the [PeterO.Text.NormalizerInput](https://peteroupc.github.io/MailLib/docs/PeterO.Text.NormalizerInput.html) class for details). Although most file systems preserve the normalization of file names, there is one notable exception: The HFS Plus file system (on macOS before High Sierra) stores file names using a modified version of normalization form D (NFD) in which certain code points are not decomposed, including all base + slash code points, which are the only composed code points in Unicode that are decomposed in NFD but not in HFS Plus's version of NFD. If the filename will be used to save a file to an HFS Plus storage device, it is enough to normalize the return value with NFD for this purpose (because all base + slash code points were converted beforehand by MakeFilename to an alternate form). See also Apple's Technical Q&A "Text Encodings in VFS" and Technical Note TN1150, "HFS Plus Volume Format".
