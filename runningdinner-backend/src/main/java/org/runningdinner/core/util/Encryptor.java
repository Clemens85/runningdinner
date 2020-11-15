package org.runningdinner.core.util;

//public class Encryptor {
//
//	/**
//	 * This is the "password" for the encryption algorithm (= the passphrase)
//	 */
//	private String encryptionKey = null;
//
//	public Encryptor(String encryptionKey) {
//		super();
//		this.encryptionKey = encryptionKey;
//	}
//
//	public String encrypt(String toEncrypt) {
//		validateEncryptionKey();
//
//		StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
//		encryptor.setPassword(encryptionKey);
//		String encryptedText = encryptor.encrypt(toEncrypt);
//		return encryptedText;
//	}
//
//	public String decrypt(String toDecrypt) {
//		validateEncryptionKey();
//
//		StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
//		encryptor.setPassword(encryptionKey);
//		String decryptedText = encryptor.decrypt(toDecrypt);
//		return decryptedText;
//	}
//
//	protected void validateEncryptionKey() {
//		if (StringUtils.isEmpty(encryptionKey)) {
//			throw new RuntimeException("No Valid encryption key");
//		}
//	}
//}