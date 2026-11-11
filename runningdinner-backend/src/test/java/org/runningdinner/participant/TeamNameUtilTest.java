package org.runningdinner.participant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.runningdinner.common.exception.ValidationException;

public class TeamNameUtilTest {

  @ParameterizedTest
  @ValueSource(strings = {
      "Die Gourmets",
      "Käsespätzle & Co.",
      "Müller/Schmidt",
      "Straße 17",
      "Hugo's Helden",
      "Team_1-A!",
      "Wirklich lecker?",
      "Ångström Ñandú",
      "Ελληνικά",
      "Кухня",
      "e\u0301toile", // decomposed (NFD) é
      "A"
  })
  public void validNames(String name) {
    assertThat(TeamNameUtil.isValid(TeamNameUtil.normalize(name))).isTrue();
    assertThat(TeamNameUtil.normalizeAndValidate(name)).isNotNull();
  }

  @ParameterizedTest
  @ValueSource(strings = {
      "<script>alert(1)</script>",
      "Quote \"test\"",
      "Back\\slash",
      "Cost $5",
      "100%",
      "Emoji \uD83D\uDE00",
      "-Leading punctuation",
      "&Leading amp",
      "Semi;colon",
      "Hash#tag",
      "Null\u0000char",
      "Zero\u200Bwidth"
  })
  public void invalidNames(String name) {
    ValidationException e = assertThrows(ValidationException.class, () -> TeamNameUtil.normalizeAndValidate(name));
    // The field is needed so that the client can show the message at the form field
    assertThat(e.getIssues().getIssues()).hasSize(1);
    assertThat(e.getIssues().getIssues().get(0).getField()).isEqualTo("teamName");
    assertThat(e.getIssues().getIssues().get(0).getMessage()).isEqualTo("team_name_invalid");
  }

  @Test
  public void lengthLimit() {
    assertThat(TeamNameUtil.normalizeAndValidate("a".repeat(TeamNameUtil.MAX_LENGTH))).hasSize(TeamNameUtil.MAX_LENGTH);
    assertThrows(ValidationException.class, () -> TeamNameUtil.normalizeAndValidate("a".repeat(TeamNameUtil.MAX_LENGTH + 1)));
  }

  @Test
  public void blankMeansNoName() {
    assertThat(TeamNameUtil.normalizeAndValidate(null)).isNull();
    assertThat(TeamNameUtil.normalizeAndValidate("")).isNull();
    assertThat(TeamNameUtil.normalizeAndValidate("   \t\n ")).isNull();
  }

  @Test
  public void normalization() {
    assertThat(TeamNameUtil.normalizeAndValidate("  Die    Gourmets \n")).isEqualTo("Die Gourmets");
    // NFD (e + combining acute) is converted to NFC (single code point)
    assertThat(TeamNameUtil.normalizeAndValidate("e\u0301toile")).isEqualTo("\u00E9toile");
  }

  @Test
  public void htmlEscaping() {
    Team team = new Team(1);
    assertThat(TeamNameUtil.getTeamNameHtmlEscaped(team)).isEmpty();

    team.setTeamName("Tom & Jerry's");
    assertThat(TeamNameUtil.getTeamNameHtmlEscaped(team)).isEqualTo("Tom &amp; Jerry&#39;s");
  }
}
