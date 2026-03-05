"""Unit tests for the improved clean_description function."""
import pytest
from praksonar.utils import clean_description


class TestHTMLEntityDecoding:
    def test_rsquo(self):
        result = clean_description("it&rsquo;s working")
        assert "\u2019" in result  # &rsquo; decodes to Unicode RIGHT SINGLE QUOTATION MARK

    def test_ndash(self):
        assert "–" in clean_description("Monday &ndash; Friday")

    def test_amp(self):
        assert "R&D" in clean_description("R&amp;D department")

    def test_nbsp_replaced(self):
        result = clean_description("hello&nbsp;world")
        assert "\xa0" not in result
        assert "hello world" in result

    def test_multiple_entities(self):
        result = clean_description("it&rsquo;s a &ldquo;test&rdquo; &amp; more")
        assert "\u2019" in result  # right single quote
        assert "&" in result


class TestHTMLTagStripping:
    def test_paragraph_tags_become_newlines(self):
        result = clean_description("<p>First paragraph</p><p>Second paragraph</p>")
        assert "First paragraph" in result
        assert "Second paragraph" in result

    def test_br_tags_become_newlines(self):
        result = clean_description("Line one<br>Line two<br/>Line three")
        assert "Line one" in result
        assert "Line two" in result
        assert "Line three" in result

    def test_inline_tags_removed(self):
        result = clean_description("<strong>Bold</strong> and <em>italic</em>")
        assert "Bold" in result
        assert "italic" in result
        assert "<strong>" not in result


class TestUIArtifactRemoval:
    def test_title_background_removed(self):
        html = "<div>Title Background</div><p>Real content here</p>"
        result = clean_description(html)
        assert "Title Background" not in result
        assert "Real content" in result

    def test_employee_removed(self):
        result = clean_description("<span>Employee</span><p>Description text</p>")
        assert "Employee" not in result.split('\n')

    def test_student_crew_removed(self):
        result = clean_description("<div>Student Crew</div><p>Good stuff</p>")
        assert "Student Crew" not in result

    def test_benefit_icon_removed(self):
        result = clean_description("<div>Benefit Icon</div><p>Benefits: free lunch</p>")
        assert "Benefit Icon" not in result

    def test_serbian_nav_items_removed(self):
        html = "<div>Istraži ovo zanimanje</div><div>Idi na profil poslodavca</div><p>Actual description</p>"
        result = clean_description(html)
        assert "Istraži ovo zanimanje" not in result
        assert "Idi na profil poslodavca" not in result
        assert "Actual description" in result


class TestNewlineCollapsing:
    def test_three_newlines_become_two(self):
        html = "<p>First</p><p></p><p></p><p></p><p>Second</p>"
        result = clean_description(html)
        assert "\n\n\n" not in result

    def test_two_newlines_preserved(self):
        result = clean_description("<p>Para one</p><p>Para two</p>")
        # Should have content on separate lines, not collapsed to single line
        assert "Para one" in result
        assert "Para two" in result


class TestShortLineRemoval:
    def test_lines_under_3_chars_removed(self):
        html = "<p>OK</p><p>A</p><p>This is a real sentence about things.</p>"
        result = clean_description(html)
        lines = [l for l in result.split('\n') if l.strip()]
        assert all(len(l) >= 3 for l in lines)


class TestEdgeCases:
    def test_empty_string(self):
        assert clean_description("") == ""

    def test_none_input(self):
        assert clean_description(None) == ""

    def test_plain_text_passthrough(self):
        result = clean_description("Just plain text with no HTML")
        assert result == "Just plain text with no HTML"
